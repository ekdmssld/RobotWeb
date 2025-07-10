package com.tsei.www.controller.tracking;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@CrossOrigin
@Controller
@RequestMapping("/arims")
public class arimsController {


    @GetMapping("/")
    public String arimsPage4(/* @AuthenticationPrincipal User user, Model model */) throws Exception {
//        model.addAttribute("loginId", user.getUsername());
        //model.addAttribute("loginRoles", user.getAuthorities());
        return "tseiweb/MonitoringSystem";
    }

}