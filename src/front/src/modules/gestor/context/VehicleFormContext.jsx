import { createContext, useMemo, useState } from 'react';

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

  const value = useMemo(
    () => ({
      formState,
      resetForm: () => setFormState(initialFormState),
      updateForm: (values) => setFormState((current) => ({ ...current, ...values })),
    }),
    [formState],
  );

  return <VehicleFormContext.Provider value={value}>{children}</VehicleFormContext.Provider>;
}

export { VehicleFormContext };
