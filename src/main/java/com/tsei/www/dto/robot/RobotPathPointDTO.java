package com.tsei.www.dto.robot;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class RobotPathPointDTO {
    private String carCode;
    private String type;
    private String date;
    private List<Point> points;


    public static class Point {
        private double latitude;
        private double longitude;
        private String date;
        private String windDirection;

        public double getLatitude() {
            return latitude;
        }

        public double getLongitude() {
            return longitude;
        }

        public String getDate() {
            return date;
        }

        public String getWindDirection() {
            return windDirection;
        }
    }

    public String getCarCode() {
        return carCode;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public List<Point> getPoints() {
        return points;
    }

    public void setPoints(List<Point> points) {
        this.points = points;
    }
}
