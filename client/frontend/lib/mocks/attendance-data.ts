// frontend/lib/mocks/attendance-data.ts
// Mock data for attendance page components

export const mockGreeting = {
  firstName: "Kwame",
  timeOfDay: "morning",
  branchName: "Accra Central Branch",
};

export const mockClockCardState = {
  isClockedIn: true,
  isBusy: false,
  activeBranch: {
    geofenceName: "Accra Central Branch",
    displayName: "Accra Central",
    shiftStart: "08:00",
    shiftEnd: "17:00",
  },
  assignedBranch: "Accra Central Branch",
  geofence: {
    insideGeofence: true,
    secondsUntilAutoClockOut: null,
    totalSeconds: null,
  },
};

export const mockLocation = {
  label: "Accra Central Branch",
  coordinates: "5.6037° N, 0.1870° W",
};