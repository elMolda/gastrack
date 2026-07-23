/** Colombian private car plates: 3 letters + 3 digits (optional dash/space). */
const COLOMBIAN_PLATE = /^[A-Za-z]{3}[-\s]?\d{3}$/;

/**
 * Optional license plate. Empty → null. Otherwise must be Colombian format ABC123.
 * Returns normalized uppercase without separator (e.g. `ABC123`).
 */
export function parseOptionalColombianLicensePlate(
	raw: string
): { ok: true; value: string | null } | { ok: false } {
	const trimmed = raw.trim();
	if (!trimmed) {
		return { ok: true, value: null };
	}

	if (!COLOMBIAN_PLATE.test(trimmed)) {
		return { ok: false };
	}

	const value = trimmed.replace(/[-\s]/g, '').toUpperCase();
	return { ok: true, value };
}
