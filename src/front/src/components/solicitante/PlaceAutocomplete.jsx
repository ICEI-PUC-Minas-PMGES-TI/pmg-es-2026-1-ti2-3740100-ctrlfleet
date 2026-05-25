import { useEffect, useId, useRef, useState } from 'react';
import { searchPlaces } from '../../services/geocodingApi';

const DEBOUNCE_MS = 450;

function useDebouncedValue(value, delay = DEBOUNCE_MS) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [delay, value]);

  return debounced;
}

export function PlaceAutocomplete({
  disabled = false,
  error = null,
  id: idProp,
  label,
  onPlaceSelect,
  onValueChange,
  placeholder,
  required = false,
  value = '',
}) {
  const autoId = useId();
  const inputId = idProp ?? autoId;
  const listId = `${inputId}-suggestions`;

  const wrapperRef = useRef(null);
  const skipSearchRef = useRef(false);
  const requestRef = useRef(0);

  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [searchError, setSearchError] = useState(null);

  const debouncedQuery = useDebouncedValue(value);

  useEffect(() => {
    if (skipSearchRef.current) {
      skipSearchRef.current = false;
      return undefined;
    }

    const query = debouncedQuery.trim();
    if (query.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      setIsLoading(false);
      setSearchError(null);
      setActiveIndex(-1);
      return undefined;
    }

    const requestId = ++requestRef.current;
    const controller = new AbortController();
    setIsLoading(true);
    setSearchError(null);

    searchPlaces(query, { signal: controller.signal })
      .then((items) => {
        if (requestId !== requestRef.current) return;
        setSuggestions(items);
        setIsOpen(items.length > 0);
        setActiveIndex(-1);
        if (items.length === 0) {
          setSearchError('Nenhum local encontrado. Tente outro termo.');
        }
      })
      .catch((fetchError) => {
        if (fetchError.name === 'AbortError' || requestId !== requestRef.current) return;
        setSuggestions([]);
        setIsOpen(false);
        setSearchError(fetchError.message || 'Falha ao buscar locais.');
      })
      .finally(() => {
        if (requestId === requestRef.current) setIsLoading(false);
      });

    return () => controller.abort();
  }, [debouncedQuery]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (!wrapperRef.current?.contains(event.target)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function selectPlace(place) {
    skipSearchRef.current = true;
    setIsOpen(false);
    setSuggestions([]);
    setActiveIndex(-1);
    setSearchError(null);
    onPlaceSelect?.(place);
  }

  function handleInputChange(event) {
    onValueChange?.(event.target.value);
    if (!isOpen && event.target.value.trim().length >= 2) {
      setIsOpen(true);
    }
  }

  function handleKeyDown(event) {
    if (!isOpen || suggestions.length === 0) {
      if (event.key === 'ArrowDown' && value.trim().length >= 2) setIsOpen(true);
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % suggestions.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((current) => (current <= 0 ? suggestions.length - 1 : current - 1));
    } else if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault();
      selectPlace(suggestions[activeIndex]);
    } else if (event.key === 'Escape') {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  }

  const hintMessage = error || searchError;
  const showList = isOpen && suggestions.length > 0 && !disabled;

  return (
    <label className="form-field place-autocomplete" htmlFor={inputId}>
      <span>{label}</span>
      <div className="place-autocomplete__wrap" ref={wrapperRef}>
        <input
          aria-autocomplete="list"
          aria-controls={showList ? listId : undefined}
          aria-expanded={showList}
          autoComplete="off"
          disabled={disabled}
          id={inputId}
          onChange={handleInputChange}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          required={required}
          role="combobox"
          type="text"
          value={value}
        />
        {isLoading ? <span className="place-autocomplete__spinner" aria-hidden="true" /> : null}

        {showList ? (
          <ul className="place-autocomplete__list" id={listId} role="listbox">
            {suggestions.map((place, index) => (
              <li key={place.id} role="presentation">
                <button
                  className={`place-autocomplete__option${index === activeIndex ? ' is-active' : ''}`}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectPlace(place)}
                  role="option"
                  type="button"
                >
                  <span className="place-autocomplete__option-head">
                    <strong>{place.label}</strong>
                    {place.category ? (
                      <em className="place-autocomplete__category">{place.category}</em>
                    ) : null}
                  </span>
                  {place.subtitle ? <span>{place.subtitle}</span> : null}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {isLoading ? <small className="requester-field-hint">Buscando locais…</small> : null}
      {!isLoading && hintMessage ? (
        <small className={`requester-field-hint${error ? ' requester-field-hint--error' : ''}`}>{hintMessage}</small>
      ) : null}
      {!isLoading && !hintMessage && value.trim().length >= 2 ? (
        <small className="requester-field-hint">
          Lojas, shoppings, órgãos públicos, ruas e outros locais — escolha uma sugestão.
        </small>
      ) : null}
    </label>
  );
}
