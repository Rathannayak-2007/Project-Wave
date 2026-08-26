# Risk Score Formula

risk_score = (heat_index_normalized * 0.6) + (vulnerability_score * 0.4)

heat_index_normalized = clamp((heat_index_c - 27) / (54 - 27), 0, 1) * 100
vulnerability_score = (elderly_pct * 0.6) + (outdoor_worker_pct * 0.4)

category:
  0-39   -> Low
  40-59  -> Moderate
  60-79  -> High
  80-100 -> Extreme
