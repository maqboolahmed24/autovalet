type ContactActionsProps = {
  phone: string;
  email: string;
};

export function ContactActions({ phone, email }: ContactActionsProps) {
  const compactPhone = phone.replace(/\s+/g, "");

  return (
    <div className="contact-actions" aria-label="Customer contact actions">
      <a href={`tel:${compactPhone}`}>Call</a>
      <a href={`sms:${compactPhone}`}>Text</a>
      <a href={`mailto:${email}`}>Email</a>
    </div>
  );
}
