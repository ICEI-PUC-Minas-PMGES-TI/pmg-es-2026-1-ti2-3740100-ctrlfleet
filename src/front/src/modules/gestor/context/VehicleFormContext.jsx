import { createContext, useCallback, useMemo, useState } from 'react';

const initialFormState = {
  plate: '',
  brand: '',
  model: '',
  year: '',
  secretaria: 'Garagem Central',
  status: 'Ativo',
  licenseCategory: 'B',
  driverId: '',
  ipvaDueDate: '',
  insuranceDueDate: '',
  licenseDueDate: '',
};

const VehicleFormContext = createContext(null);

export function VehicleFormProvider({ children }) {
  const [formState, setFormState] = useState(initialFormState);
  const resetForm = useCallback(() => setFormState(initialFormState), []);
  const updateForm = useCallback(
    (values) => setFormState((current) => ({ ...current, ...values })),
    [],
  );

  const value = useMemo(
    () => ({
      formState,
      resetForm,
      updateForm,
    }),
    [formState, resetForm, updateForm],
  );

  return <VehicleFormContext.Provider value={value}>{children}</VehicleFormContext.Provider>;
}

export { VehicleFormContext };
