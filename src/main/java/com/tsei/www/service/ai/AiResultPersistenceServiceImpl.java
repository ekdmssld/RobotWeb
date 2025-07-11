package com.tsei.www.service.ai;

import com.tsei.www.dto.ai.PredictedChemicalDTO;
import com.tsei.www.mapper.no2.AiPredictMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AiResultPersistenceServiceImpl implements AiResultPersistenceService {

    private final AiPredictMapper aiPredictMapper;

    private final static String[] chemicalNames = {
            "methyl butanoate", "pentanal", "propylbenzene", "triethylamine",
            "trichloroethylene", "toluene", "thiophene", "tertiary butyl acetate",
            "styrene", "s-butylamine", "pyridine", "propyl propanoate",
            "pentane", "propyl butanoate", "propyl acetate", "propene",
            "propanoic acid", "propane", "propanal", "phenol",
            "trimethylamine", "p-cresol"
    };

    @Override
    public void savePredictionResults(int detailId, List<Double> predictions) {
        if (predictions.size() != chemicalNames.length) {
            throw new IllegalArgumentException("예측된 값의 개수가 22개가 아닙니다.");
        }

        List<PredictedChemicalDTO> dtoList = new ArrayList<>();
        for (int i = 0; i < chemicalNames.length; i++) {
            PredictedChemicalDTO dto = new PredictedChemicalDTO();
            dto.setDetailId(detailId);
            dto.setChemicalName(chemicalNames[i]);
            dto.setPredictedValue(predictions.get(i));
            dtoList.add(dto);
        }

        aiPredictMapper.insertPredictions(dtoList);
    }
}
