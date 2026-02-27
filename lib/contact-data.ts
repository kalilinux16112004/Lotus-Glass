import { MapPin, Phone, Mail, Clock } from "lucide-react";

/* =====================
   Types
===================== */
export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  isHeadOffice?: boolean;
}

/* =====================
   Company Info
===================== */
export const companyContact = {
  businessHours: "Mon – Sat: 9:00 AM – 6:00 PM",
};

/* =====================
   Branches (Single Source of Truth)
===================== */
export const branches: Branch[] = [
  {
    id: "mumbai",
    name: "Head Office – Mumbai",
    address:
      "B-11, DM Singh Compound, Opp. Shradda Tower, Thakur Complex, Kandivali (E), Mumbai – 400101",
    phone: "+91 9334779058 / +91 9833992158 | 022-28701651",
    email:
      "info@lotusenterprises.net / lotusenterprises2006@rediffmail.com",
    isHeadOffice: true,
  },
  {
    id: "vadodara",
    name: "Branch Office – Vadodara",
    address:
      "Office No. 1, 2nd Floor, Mrudula Sadan, Opp. Maharashtra Lodge, Dandia Bazar, Vadodara, Gujarat – 390001",
    phone: "+91 9328449803 / +91 8866308730",
    email: "info@lotusenterprises.net",
  },
  {
    id: "rajasthan",
    name: "Branch Office – Rajasthan",
    address:
      "Near B.B.I. Bank, Pratap Bazar, Bani Station – 306115, Dist. Pali (Rajasthan)",
    phone: "+91 8955270917 / +91 9020445577",
    email: "info@lotusenterprises.net",
  },
];

/* =====================
   Contact Info (Auto-Derived)
===================== */
const headOffice = branches.find((b) => b.isHeadOffice)!;

export const contactInfo = [
  {
    label: "Head Office",
    value: headOffice.address,
    icon: MapPin,
  },
  {
    label: "Phone",
    value: headOffice.phone,
    icon: Phone,
  },
  {
    label: "Email",
    value: headOffice.email,
    icon: Mail,
  },
  {
    label: "Business Hours",
    value: companyContact.businessHours,
    icon: Clock,
  },
];
