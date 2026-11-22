export const ITEM_CATEGORIES = [
  "Electronics",
  "Documents",
  "Wallets",
  "Bags",
  "Accessories",
  "Keys",
  "Clothing",
  "Others",
] as const;

export type ItemCategory = (typeof ITEM_CATEGORIES)[number];

export const INDIAN_CITIES = [
  "Mumbai",
  "Delhi NCR",
  "Bengaluru",
  "Hyderabad",
  "Pune",
  "Chennai",
  "Kolkata",
  "Ahmedabad",
  "Jaipur",
  "Chandigarh",
  "Lucknow",
  "Kochi",
  "Indore",
  "Nagpur",
  "Bhopal",
  "Patna",
  "Other City",
] as const;

export const ITEM_COLORS = [
  "Black",
  "Dark Blue / Navy",
  "Brown / Tan",
  "Grey / Silver",
  "White",
  "Red / Maroon",
  "Green",
  "Yellow / Gold",
  "Multi-colored",
  "Other",
] as const;

export const CUSTODY_TYPES = [
  { value: "WITH_FINDER", label: "In My Safe Possession (Finder)" },
  { value: "SECURITY_DESK", label: "Handed to Security Desk / Gate" },
  { value: "POLICE_STATION", label: "Deposited at Local Police Station" },
  { value: "LOST_AND_FOUND_OFFICE", label: "Deposited at Lost & Found Counter / Station Master" },
] as const;

