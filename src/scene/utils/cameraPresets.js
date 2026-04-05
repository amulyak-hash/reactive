// Camera presets — lookAt matches actual zone positions from model clicks.
// Camera position offset ~6-8 units from lookAt for a good framing.

export const ZONE_PRESETS = {
  bf: {
    position: [-1, 8, -16],
    lookAt: [-5.43, 3.11, -12.11],
    label: 'Blast Furnace BF-3',
  },
  sms: {
    position: [7, 8, -9],
    lookAt: [3, 4, -5],
    label: 'Steel Melting Shop BOF-2',
  },
  cc: {
    position: [19, 8, 4],
    lookAt: [14.74, 3.13, -0.48],
    label: 'Continuous Casting CCM-3',
  },
  rm: {
    position: [-8, 8, -7],
    lookAt: [-12, 4, -3],
    label: 'Rolling Mill HSM-1',
  },
  ql: {
    position: [-6, 8, 15],
    lookAt: [-9.85, 3.19, 10.88],
    label: 'Quality Lab QC',
  },
};

export const OVERVIEW_PRESET = {
  position: [30, 20, 30],
  lookAt: [0, 0, 0],
};
