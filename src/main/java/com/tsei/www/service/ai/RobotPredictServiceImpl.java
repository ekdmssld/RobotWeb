package com.tsei.www.service.robot;

import com.tsei.www.dto.tracking.SensorDataDTO;
import com.tsei.www.mapper.no2.RobotMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.http.HttpHeaders;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class RobotPredictServiceImpl implements RobotPredictService {

    private final RobotMapper robotMapper;
    private final RestTemplate restTemplate;

    @Override
    public Map<String, Double> predictChemicalsByCarCode(String carCode, String timestamp) {
        List<SensorDataDTO> sensorDataList = robotMapper.getSensorDataByCarCodeAndTimestamp(carCode, timestamp);

        if (sensorDataList.size() != 12) {
            throw new RuntimeException("센서 데이터가 12개가 아닙니다. 총 개수: " + sensorDataList.size());
        }

        List<Double> vector = new ArrayList<>();
        for (SensorDataDTO dto : sensorDataList) {
            vector.add(dto.getPpm());
            vector.add(dto.getRatio());
            vector.add(dto.getRs());
            vector.add(dto.getRo());
        }

        String url = "http://localhost:5001/predict";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> request = new HashMap<>();
        request.put("vector", vector);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);

        ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

        if (response.getStatusCode() == HttpStatus.OK) {
            return response.getBody();
        } else {
            throw new RuntimeException("AI 예측 API 응답 실패: " + response.getStatusCode());
        }
    }
}
