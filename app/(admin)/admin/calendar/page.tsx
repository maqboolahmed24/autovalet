import { AdminCalendarPage } from "../../../../components/admin/AdminCalendarPage";
import {
  adminCalendarUsesMockData,
  buildAdminCalendarWeek,
  getAdminCalendarDay,
  parseAdminCalendarDate,
} from "../../../../lib/admin/calendar";

export const metadata = {
  title: "Calendar | AUTO VALET Admin",
  description: "AUTO VALET admin day timeline for jobs, requests, holds and blocked time.",
};

type AdminCalendarRouteProps = {
  searchParams?: Promise<{
    date?: string | string[];
  }> | {
    date?: string | string[];
  };
};

export default async function AdminCalendarRoute({ searchParams }: AdminCalendarRouteProps) {
  const resolvedSearchParams = await Promise.resolve(searchParams ?? {});
  const dateParam = Array.isArray(resolvedSearchParams.date)
    ? resolvedSearchParams.date[0]
    : resolvedSearchParams.date;
  const selectedDate = parseAdminCalendarDate(dateParam);
  const day = await getAdminCalendarDay({ date: selectedDate });
  const weekDays = buildAdminCalendarWeek(selectedDate);

  return <AdminCalendarPage day={day} isMockData={adminCalendarUsesMockData} weekDays={weekDays} />;
}
