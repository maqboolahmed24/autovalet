"use client";

import Link from "next/link";
import { useState } from "react";
import { CustomerBookingHistory } from "./CustomerBookingHistory";
import { CustomerHeroCard } from "./CustomerHeroCard";
import { CustomerNotesCard } from "./CustomerNotesCard";
import { CustomerPrivacyCard } from "./CustomerPrivacyCard";
import { CustomerVehicleList } from "./CustomerVehicleList";
import { EditCustomerNoteSheet } from "./EditCustomerNoteSheet";
import type { AdminCustomerProfileData } from "../../lib/admin/customers";

type CustomerProfilePageProps = {
  data: AdminCustomerProfileData;
};

export function CustomerProfilePage({ data }: CustomerProfilePageProps) {
  const [isAddingNote, setIsAddingNote] = useState(false);

  return (
    <div className="admin-page customer-profile-page">
      <div className="booking-detail-page__top">
        <Link className="ghost-button" href="/admin/customers">
          Back to customers
        </Link>
        {data.isMockData ? <span className="admin-auth-badge">Mock data</span> : null}
      </div>

      <div className="customer-profile">
        <div className="customer-profile__main">
          <CustomerHeroCard customer={data.customer} />
          <CustomerVehicleList vehicles={data.vehicles} />
          <CustomerBookingHistory bookings={data.bookingHistory} />
        </div>

        <aside className="customer-profile__side" aria-label="Customer notes and privacy">
          <CustomerNotesCard notes={data.notes} onAddNote={() => setIsAddingNote(true)} />
          <CustomerPrivacyCard />
        </aside>
      </div>

      {isAddingNote ? (
        <div className="admin-sheet-backdrop" role="presentation">
          <EditCustomerNoteSheet customerId={data.customer.id} onClose={() => setIsAddingNote(false)} />
        </div>
      ) : null}
    </div>
  );
}
