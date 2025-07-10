package com.tsei.www.controller.robot;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/arims/robot")
public class robotController {

    /**
     * 로봇 추적 페이지 로딩
     */
    @GetMapping
    public String robotPage() {
        return "tseiweb/robot"; // => src/main/resources/templates/tseiweb/robot.html
    }
}
