"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

type CustomerSearchBarProps = {
  search?: string;
};

export function CustomerSearchBar({ search = "" }: CustomerSearchBarProps) {
  const [value, setValue] = useState(search);
  const pathname = usePathname();
  const router = useRouter();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();

    if (value.trim()) {
      params.set("search", value.trim());
    }

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <form className="admin-search customer-search" onSubmit={handleSubmit}>
      <label htmlFor="customer-search">Search customers</label>
      <div className="admin-search__row">
        <input
          id="customer-search"
          name="search"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Name, phone, email, postcode or vehicle"
          type="search"
        />
        <button className="ghost-button" type="submit">
          Search
        </button>
      </div>
    </form>
  );
}
