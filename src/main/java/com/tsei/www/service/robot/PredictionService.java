package com.tsei.www.service.robot;

import com.tsei.www.dto.robot.SensorDTO;
import com.tsei.www.dto.robot.SensorListDTO;
import com.tsei.www.repository.PredictionResultRepository;
import com.tsei.www.repository.SensorDataRepository;
import com.tsei.www.vo.PredictionResultEntity;
import com.tsei.www.vo.SensorDataEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PredictionService {

    private final RestTemplate restTemplate;
    private final SensorDataRepository sensorDataRepository;
    private final PredictionResultRepository predictionResultRepository;

    public void predictAndSave(Long startId) {

        // 1. 센서 데이터 12개 조회 (id: startId ~ startId+11)
        List<SensorDataEntity> sensorEntities = sensorDataRepository.findByIdBetween(startId, startId + 11);

        // 2. Flask로 전송
        List<SensorDTO> dtoList = sensorEntities.stream().map(entity -> {
            SensorDTO dto = new SensorDTO();
            dto.setPpmRefGo(entity.getPpmRefGo());
            dto.setTemp(entity.getTemp());
            dto.setHumi(entity.getHumi());
            dto.setPre(entity.getPre());
            dto.setRatio(entity.getRatio());
            dto.setPpm(entity.getPpm());
            dto.setPpmGo(entity.getPpmGo());  // DB 컬럼 존재하므로 유지
            dto.setRs(entity.getRs());
            dto.setRo(entity.getRo());
            dto.setRefFactor(entity.getRefFactor());
            return dto;
        }).collect(Collectors.toList());


        //3. Flask 서버에 POST 요청
        SensorListDTO requestDto = new SensorListDTO();
        requestDto.setSensorList(dtoList);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<SensorListDTO> request = new HttpEntity<>(requestDto, headers);

        ResponseEntity<Map> response = restTemplate.postForEntity("http://localhost:5000/predict", request, Map.class);

        // 4. 결과를 prediction_result 테이블에 저장
        Map<String, Double> predictionMap = response.getBody();
        if (predictionMap != null) {
            List<PredictionResultEntity> results = predictionMap.entrySet().stream().map(entry ->
                    new PredictionResultEntity(null, entry.getKey(), entry.getValue(), null)
            ).collect(Collectors.toList());

//            System.out.println("→ 저장할 예측값 수: " + results.size());
            results.forEach(r -> System.out.println(r.getChemicalName() + " : " + r.getPredictedValue()));
            predictionResultRepository.saveAll(results);
//            System.out.println("saveAll() 호출 완료");
        } else {
            System.out.println("예측 결과 없음 또는 Flask 응답 실패");
        }
    }
}



