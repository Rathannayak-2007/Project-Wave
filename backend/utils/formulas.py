"""
Heat Index formula (NWS Rothfusz regression), WBGT approximation, UTCI approximation,
risk-score normalization, and mortality risk framing.
"""

import math

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


def wbgt_outdoor(temp_c: float, humidity_pct: float, wind_kmh: float, solar_wm2: float) -> float:
    """
    Approximation of WBGT (Wet-Bulb Globe Temperature).
    Uses Stull's formula for natural wet bulb temperature, and a simplified estimate for globe temperature.
    """
    # Stull's formula for Wet Bulb Temperature (Tw)
    T = temp_c
    rh = humidity_pct
    tw = (T * math.atan(0.151977 * math.pow(rh + 8.313659, 0.5)) +
          math.atan(T + rh) - math.atan(rh - 1.676331) +
          0.00391838 * math.pow(rh, 1.5) * math.atan(0.023101 * rh) - 4.686035)

    # Simplified Globe Temperature (Tg) estimation
    # Solar radiation adds heat, wind (m/s) removes it.
    wind_ms = wind_kmh / 3.6
    wind_ms = max(wind_ms, 0.5) # Assume minimum air movement
    
    # Very simplified Tg estimation: Tg = Td + (solar heating) - (wind cooling)
    solar_heating = (solar_wm2 * 0.02)
    tg = T + solar_heating / math.sqrt(wind_ms)

    # WBGT = 0.7*Tw + 0.2*Tg + 0.1*Td
    wbgt = 0.7 * tw + 0.2 * tg + 0.1 * T
    return round(wbgt, 1)


def utci_approx(temp_c: float, humidity_pct: float, wind_kmh: float, solar_wm2: float) -> float:
    """
    Simplified approximation for UTCI without the full 210-term polynomial.
    This provides a directional UTCI value for demonstration purposes.
    """
    wind_ms = wind_kmh / 3.6
    wind_ms = max(wind_ms, 0.5)
    
    # Calculate Mean Radiant Temperature (Tmrt) approximation
    tmrt = temp_c + (solar_wm2 * 0.025)
    
    # Calculate vapor pressure (e) in hPa
    # e = rh/100 * 6.112 * exp((17.67 * T) / (T + 243.5))
    e = (humidity_pct / 100.0) * 6.112 * math.exp((17.67 * temp_c) / (temp_c + 243.5))

    # Very simplified UTCI regression mapping (for demo/proxy use only)
    # UTCI roughly equals air temp + radiant heat impact - wind cooling + humidity impact
    utci = temp_c + 0.3 * (tmrt - temp_c) - 1.5 * (math.sqrt(wind_ms) - 1) + 0.1 * (e - 12)
    return round(utci, 1)


def normalize_metric(value: float, floor: float, ceiling: float) -> float:
    clamped = max(floor, min(value, ceiling))
    return ((clamped - floor) / (ceiling - floor)) * 100


def vulnerability_score(elderly_pct: float, outdoor_worker_pct: float, pop_density: float) -> float:
    # Scale pop density (assume max dense ~ 30000 for mapping)
    density_factor = min(pop_density / 30000.0, 1.0) * 100
    
    # Weight: 40% elderly, 40% outdoor workers, 20% density
    return round((elderly_pct * 0.4) + (outdoor_worker_pct * 0.4) + (density_factor * 0.2), 1)


def composite_risk_score(hi: float, wbgt: float, utci: float, elderly_pct: float, outdoor_worker_pct: float, pop_density: float) -> float:
    """
    Blends the 3 thermal metrics with demographics for a master score 0-100.
    """
    hi_norm = normalize_metric(hi, 27.0, 54.0)
    wbgt_norm = normalize_metric(wbgt, 20.0, 35.0)
    utci_norm = normalize_metric(utci, 26.0, 46.0)
    
    climate_score = (hi_norm * 0.3) + (wbgt_norm * 0.35) + (utci_norm * 0.35)
    vuln_score = vulnerability_score(elderly_pct, outdoor_worker_pct, pop_density)
    
    return round((climate_score * 0.6) + (vuln_score * 0.4), 1)


def risk_category(score: float):
    if score < 40:
        return "Low", "#84B59F"
    elif score < 60:
        return "Moderate", "#F9E795"
    elif score < 80:
        return "High", "#F96167"
    else:
        return "Extreme", "#990011"


def mortality_risk_label(score: float) -> str:
    if score < 40:
        return "Baseline risk. Standard precautions sufficient."
    elif score < 60:
        return "Elevated risk for outdoor workers and elderly residents. Recommend hydration advisories."
    elif score < 80:
        return "Significant risk of heat-related illness. Hospitals should prepare for increased heat-stress admissions."
    else:
        return "Severe risk. Research links this exposure level to measurable increases in heat-related mortality among vulnerable groups. Immediate public health action recommended (cooling centers, outdoor work restrictions)."
