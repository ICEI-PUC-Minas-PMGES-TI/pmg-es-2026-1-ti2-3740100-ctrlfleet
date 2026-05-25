import { useEffect, useState } from 'react';
import { geocodePlace } from '../../services/geocodingApi';
import { PlaceAutocomplete } from './PlaceAutocomplete';

export function RouteAddressSearch({
  activePoint = 'destino',
  disabled = false,
  onActivePointChange,
  onPlaceFound,
}) {
  const [query, setQuery] = useState('');
  const [numero, setNumero] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [refineError, setRefineError] = useState(null);

  useEffect(() => {
    setQuery('');
    setNumero('');
    setRefineError(null);
    setIsRefining(false);
  }, [activePoint]);

  async function handlePlaceSelect(place) {
    const number = numero.trim();

    if (!number) {
      onPlaceFound?.(place, activePoint);
      setQuery(place.label);
      return;
    }

    setIsRefining(true);
    setRefineError(null);

    try {
      const refined = await geocodePlace(`${place.label}, ${number}`);
      onPlaceFound?.(refined, activePoint);
      setQuery(refined.label);
    } catch (error) {
      onPlaceFound?.(place, activePoint);
      setRefineError(error.message || 'Número não localizado; usando o endereço da sugestão.');
      setQuery(place.label);
    } finally {
      setIsRefining(false);
    }
  }

  const pointLabel = activePoint === 'origem' ? 'origem (A)' : 'destino (B)';

  return (
    <section className="route-address-search" aria-labelledby="route-address-search-title">
      <header className="route-address-search__head">
        <h3 id="route-address-search-title">Buscar endereço</h3>
        <p>
          Digite o nome da rua ou do local — as sugestões aparecem enquanto você escreve. O número é opcional.
        </p>
      </header>

      <div className="route-address-search__point-tabs" role="tablist" aria-label="Ponto do trajeto">
        <button
          aria-selected={activePoint === 'origem'}
          className={`route-address-search__point-tab${activePoint === 'origem' ? ' is-active' : ''}`}
          disabled={disabled}
          onClick={() => onActivePointChange?.('origem')}
          role="tab"
          type="button"
        >
          Origem (A)
        </button>
        <button
          aria-selected={activePoint === 'destino'}
          className={`route-address-search__point-tab${activePoint === 'destino' ? ' is-active' : ''}`}
          disabled={disabled}
          onClick={() => onActivePointChange?.('destino')}
          role="tab"
          type="button"
        >
          Destino (B)
        </button>
      </div>

      <p className="route-address-search__active-hint">
        Buscando para: <strong>{pointLabel}</strong>
      </p>

      <div className="route-address-search__fields">
        <PlaceAutocomplete
          key={activePoint}
          disabled={disabled || isRefining}
          id={`route-search-${activePoint}`}
          label="Endereço ou local"
          onPlaceSelect={handlePlaceSelect}
          onValueChange={setQuery}
          placeholder="Ex.: Av. Afonso Pena, Shopping Cidade..."
          value={query}
        />

        <label className="form-field route-address-search__number">
          <span>Número (opcional)</span>
          <input
            autoComplete="off"
            disabled={disabled || isRefining}
            inputMode="text"
            onChange={(event) => {
              setNumero(event.target.value);
              setRefineError(null);
            }}
            placeholder="Ex.: 1500"
            type="text"
            value={numero}
          />
        </label>
      </div>

      {isRefining ? <small className="requester-field-hint">Ajustando ponto com o número informado…</small> : null}
      {!isRefining && refineError ? (
        <small className="requester-field-hint requester-field-hint--error">{refineError}</small>
      ) : null}
    </section>
  );
}
