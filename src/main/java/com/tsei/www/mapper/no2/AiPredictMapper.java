package com.tsei.www.mapper.no2;

import com.tsei.www.dto.ai.PredictedChemicalDTO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface AiPredictMapper {
    void insertPredictions(List<PredictedChemicalDTO> predictions);
}