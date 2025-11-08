import { useState, useEffect } from "react";
import { getUserById } from "../../services/user.service";
import { getPropertyById } from "../../../property/services/property.service";
import type { User } from "../../types/user";
import type { Property } from "../../../property/types/property";

export function useContractNames(userId?: string, propertyId?: number | string) {
  const [userName, setUserName] = useState("");
  const [propertyName, setPropertyName] = useState("");

  // ---------- USER ----------
  useEffect(() => {
    let alive = true;
    if (!userId) {
      setUserName("");
      return;
    }

    getUserById(userId)
      .then((resp: any) => {
        const u: User = resp?.data ?? resp;
        if (alive) setUserName(`${u?.firstName ?? ""} ${u?.lastName ?? ""}`.trim());
      })
      .catch((e) => {
        console.error("user name error", e);
        alive && setUserName("");
      });

    return () => {
      alive = false;
    };
  }, [userId]);

  // ---------- PROPERTY ----------
  useEffect(() => {
    let alive = true;
    const pid = typeof propertyId === "string" ? Number(propertyId) : propertyId;
    if (!pid || Number.isNaN(pid)) {
      setPropertyName("");
      return;
    }

    getPropertyById(pid as number)
      .then((resp: any) => {
        const p: Property = resp?.data ?? resp;
        if (alive) setPropertyName(p?.title ?? "");
      })
      .catch((e) => {
        console.error("property name error", e);
        alive && setPropertyName("");
      });

    return () => {
      alive = false;
    };
  }, [propertyId]);

  return { userName, propertyName };
}
