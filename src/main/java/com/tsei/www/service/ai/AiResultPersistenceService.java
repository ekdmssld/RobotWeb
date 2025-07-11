package com.tsei.www.service.ai;

import java.util.List;

public interface AiResultPersistenceService {
    void savePredictionResults(int detailId, List<Double> predictions);
}
