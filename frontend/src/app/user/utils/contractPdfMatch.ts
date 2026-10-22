// Busca en lo que ya está cargado (usuarios, propiedades, índices, garantes)
// lo que corresponde a los datos leídos del PDF de un contrato.

export const normalize = (s?: string | null) =>
  (s ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const STOP_WORDS = new Set(["de", "del", "la", "las", "el", "los", "y", "calle", "av", "avenida", "n", "nro", "numero", "piso", "depto", "dpto", "barrio", "b", "cordoba"]);

const tokens = (s?: string | null) => normalize(s).split(" ").filter((t) => t && !STOP_WORDS.has(t));

/** proporción de palabras de `a` que aparecen en `b` (0..1) */
export const overlap = (a?: string | null, b?: string | null) => {
  const ta = tokens(a);
  if (!ta.length) return 0;
  const tb = new Set(tokens(b));
  return ta.filter((t) => tb.has(t)).length / ta.length;
};

export interface UserLike {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

export const findUser = <U extends UserLike>(
  users: U[],
  person: { fullName?: string | null; email?: string | null } | null
): U | null => {
  if (!person) return null;
  const email = normalize(person.email);
  if (email) {
    const byEmail = users.find((u) => normalize(u.email) === email);
    if (byEmail) return byEmail;
  }
  if (!person.fullName) return null;
  // todas las palabras del nombre cargado tienen que estar en el del contrato
  // (el contrato suele traer segundo nombre: "Marianela Soledad Pirani" = "Marianela Pirani")
  const candidates = users.filter((u) => {
    const full = `${u.firstName ?? ""} ${u.lastName ?? ""}`;
    return tokens(full).length >= 2 && overlap(full, person.fullName) === 1;
  });
  // si hay más de uno, el que más se parece en el otro sentido
  candidates.sort(
    (a, b) =>
      overlap(person.fullName, `${b.firstName} ${b.lastName}`) - overlap(person.fullName, `${a.firstName} ${a.lastName}`)
  );
  return candidates[0] ?? null;
};

export interface PropertyLike {
  id: number;
  title?: string;
  street?: string;
  number?: string | number;
}

export const findProperty = <P extends PropertyLike>(properties: P[], address?: string | null): P | null => {
  if (!address) return null;
  const addressTokens = new Set(tokens(address));
  let best: P | null = null;
  let bestScore = 0;
  for (const p of properties) {
    const streetScore = overlap(p.street, address);
    if (!streetScore) continue;
    const num = normalize(String(p.number ?? "")).replace(/\s/g, "");
    // "3.225" del contrato se normaliza a "3 225": se compara sin espacios
    const numberMatches = num ? addressTokens.has(num) || normalize(address).replace(/\s/g, "").includes(num) : false;
    const score = streetScore + (numberMatches ? 1 : 0) + overlap(p.title, address) * 0.3;
    if (score > bestScore) {
      bestScore = score;
      best = p;
    }
  }
  // calle y número tienen que coincidir
  return bestScore >= 1.5 ? best : null;
};

export interface IndexLike {
  id: number;
  code: string;
  name: string;
}

export const findIndex = <I extends IndexLike>(indexes: I[], text?: string | null): I | null => {
  const t = normalize(text);
  if (!t) return null;
  return (
    indexes.find((i) => normalize(i.code) === t) ??
    indexes.find((i) => normalize(i.name) === t) ??
    indexes.find((i) => t.split(" ").includes(normalize(i.code))) ??
    indexes.find((i) => normalize(i.name).length > 3 && (t.includes(normalize(i.name)) || normalize(i.name).includes(t))) ??
    null
  );
};

/** "PIRANI, Marianela" / "Marianela Pirani" -> { firstName, lastName } */
export const splitFullName = (fullName: string) => {
  const clean = fullName.trim().replace(/\s+/g, " ");
  if (clean.includes(",")) {
    const [last, first] = clean.split(",").map((s) => s.trim());
    return { firstName: titleCase(first ?? ""), lastName: titleCase(last ?? "") };
  }
  const parts = clean.split(" ");
  if (parts.length === 1) return { firstName: titleCase(parts[0]), lastName: "" };
  const lastName = parts.pop()!;
  return { firstName: titleCase(parts.join(" ")), lastName: titleCase(lastName) };
};

export const titleCase = (s: string) =>
  s
    .toLowerCase()
    .split(" ")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
