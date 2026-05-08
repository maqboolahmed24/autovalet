type OutsideZoneSettingsCardProps = {
  minimumVehicleCount: number;
};

export function OutsideZoneSettingsCard({ minimumVehicleCount }: OutsideZoneSettingsCardProps) {
  return (
    <aside className="settings-card outside-zone-settings-card" aria-labelledby="outside-zone-settings-title">
      <div className="settings-card__header">
        <div>
          <p className="eyebrow">Outside zone</p>
          <h2 id="outside-zone-settings-title">Outside-zone rules</h2>
          <p>Customers outside your normal areas can only request a booking if they meet the minimum vehicle count.</p>
        </div>
      </div>

      <div className="settings-metric">
        <span>Minimum vehicles</span>
        <strong>{minimumVehicleCount}</strong>
        <p>Default rule for outside-zone requests at the same address.</p>
      </div>

      <p className="admin-inline-note">
        Outside-zone requests may be considered; this does not guarantee approval.
      </p>
    </aside>
  );
}
