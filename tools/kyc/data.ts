export interface KYCCase extends Record<string, unknown> {
  id: string;
  customerName: string;
  email: string;
  status: "Pending" | "Escalated" | "Approved" | "Rejected";
  risk: "Low" | "Medium" | "High";
  submittedAt: string;
  address: string;
  dateOfBirth: string;
  ssn: string; // sensitive
  riskIndicators: string[];
  notes: string;
}

export const initialKycData: KYCCase[] = [
  {
    id: "kyc-001",
    customerName: "Alice Freeman",
    email: "alice.freeman@example.com",
    status: "Pending",
    risk: "Low",
    submittedAt: "2026-08-25T09:00:00Z",
    address: "123 Maple St, Springfield",
    dateOfBirth: "1985-03-12",
    ssn: "123-45-6789",
    riskIndicators: ["new customer"],
    notes: "First review.",
  },
  {
    id: "kyc-002",
    customerName: "Benjamin Cho",
    email: "ben.cho@example.com",
    status: "Pending",
    risk: "High",
    submittedAt: "2026-08-25T11:30:00Z",
    address: "88 Industrial Rd, Riverport",
    dateOfBirth: "1979-11-04",
    ssn: "987-65-4321",
    riskIndicators: ["high velocity", "jurisdiction mismatch"],
    notes: "Requires senior review before approval.",
  },
  {
    id: "kyc-003",
    customerName: "Carmen Diaz",
    email: "carmen.diaz@example.com",
    status: "Escalated",
    risk: "Medium",
    submittedAt: "2026-08-24T14:15:00Z",
    address: "45 Ocean Ave, Westview",
    dateOfBirth: "1992-07-22",
    ssn: "555-12-3456",
    riskIndicators: ["address mismatch"],
    notes: "Escalated for document verification.",
  },
  {
    id: "kyc-004",
    customerName: "Daniel Rogers",
    email: "daniel.rogers@example.com",
    status: "Approved",
    risk: "Low",
    submittedAt: "2026-08-23T10:00:00Z",
    address: "72 Birch Ln, Northwood",
    dateOfBirth: "1988-01-30",
    ssn: "444-55-6666",
    riskIndicators: [],
    notes: "Approved by senior reviewer.",
  },
  {
    id: "kyc-005",
    customerName: "Elena Voss",
    email: "elena.voss@example.com",
    status: "Rejected",
    risk: "High",
    submittedAt: "2026-08-22T16:45:00Z",
    address: "Unknown",
    dateOfBirth: "1990-09-09",
    ssn: "777-88-9999",
    riskIndicators: ["sanctions list match", "missing documents"],
    notes: "Rejected due to incomplete documentation.",
  },
];
