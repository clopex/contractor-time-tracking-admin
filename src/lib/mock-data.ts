export const dashboardStats = [
  { label: "Hours this week", value: "126h", trend: "+12%" },
  { label: "Pending approvals", value: "8", trend: "-2" },
  { label: "Active projects", value: "14", trend: "+3" },
  { label: "Projected revenue", value: "$18.4k", trend: "+9%" },
];

export const approvalQueue = [
  {
    id: "ts-1001",
    contractor: "Amar H.",
    project: "Kitchen Remodel - Block A",
    hours: 32,
    status: "Submitted",
  },
  {
    id: "ts-1002",
    contractor: "Maja T.",
    project: "HVAC Retrofit",
    hours: 27,
    status: "Submitted",
  },
  {
    id: "ts-1003",
    contractor: "Nedim K.",
    project: "Warehouse Fit-Out",
    hours: 18,
    status: "Needs review",
  },
];

export const projects = [
  {
    code: "KITCHEN-A",
    name: "Kitchen Remodel - Block A",
    client: "Alpha Construction",
    status: "Active",
    budget: "$25,000",
  },
  {
    code: "HVAC-RETRO",
    name: "HVAC Retrofit",
    client: "Urban Facilities",
    status: "Active",
    budget: "$16,500",
  },
  {
    code: "WARE-FIT",
    name: "Warehouse Fit-Out",
    client: "North Yard",
    status: "At risk",
    budget: "$11,900",
  },
];

export const reports = [
  { label: "Billable utilization", value: "78%" },
  { label: "Approval cycle", value: "1.3 days" },
  { label: "Average hourly rate", value: "$47" },
];
