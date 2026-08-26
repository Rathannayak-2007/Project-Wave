"""
Heat Index formula (NWS Rothfusz regression) and risk-score normalization.
See docs/formulas.md for the plain-language version used in the pitch.
"""


def heat_index_celsius(temp_c: float, humidity_pct: float) -> float:
    t_f = temp_c * 9 / 5 + 32
    rh = humidity_pct

    hi_simple = 0.5 * (t_f + 61.0 + ((t_f - 68.0) * 1.2) + (rh * 0.094))

    if (t_f + hi_simple) / 2 < 80:
        hi_f = hi_simple
    else:
        hi_f = (
            -42.379
            + 2.04901523 * t_f
            + 10.14333127 * rh
            - 0.22475541 * t_f * rh
            - 0.00683783 * t_f * t_f
            - 0.05481717 * rh * rh
            + 0.00122874 * t_f * t_f * rh
            + 0.00085282 * t_f * rh * rh
            - 0.00000199 * t_f * t_f * rh * rh
        )
        if rh < 13 and 80 <= t_f <= 112:
            adjustment = ((13 - rh) / 4) * ((17 - abs(t_f - 95)) / 17) ** 0.5
            hi_f -= adjustment
        elif rh > 85 and 80 <= t_f <= 87:
            adjustment = ((rh - 85) / 10) * ((87 - t_f) / 5)
            hi_f += adjustment

    hi_c = (hi_f - 32) * 5 / 9
    return round(hi_c, 1)


def normalize_heat_index(heat_index_c: float, floor_c: float = 27.0, ceiling_c: float = 54.0) -> float:
    clamped = max(floor_c, min(heat_index_c, ceiling_c))
    return round(((clamped - floor_c) / (ceiling_c - floor_c)) * 100, 1)


def vulnerability_score(elderly_pct: float, outdoor_worker_pct: float) -> float:
    return round((elderly_pct * 0.6) + (outdoor_worker_pct * 0.4), 1)


def risk_score(heat_index_c: float, elderly_pct: float, outdoor_worker_pct: float) -> float:
    hi_norm = normalize_heat_index(heat_index_c)
    vuln = vulnerability_score(elderly_pct, outdoor_worker_pct)
    return round((hi_norm * 0.6) + (vuln * 0.4), 1)


def risk_category(score: float):
    if score < 40:
        return "Low", "#84B59F"
    elif score < 60:
        return "Moderate", "#F9E795"
    elif score < 80:
        return "High", "#F96167"
    else:
        return "Extreme", "#990011"
