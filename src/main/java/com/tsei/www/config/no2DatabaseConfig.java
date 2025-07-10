//package com.tsei.www.config;
//
//import org.apache.ibatis.session.SqlSessionFactory;
//import org.mybatis.spring.SqlSessionFactoryBean;
//import org.mybatis.spring.SqlSessionTemplate;
//import org.mybatis.spring.annotation.MapperScan;
//import org.springframework.beans.factory.annotation.Qualifier;
//import org.springframework.boot.context.properties.ConfigurationProperties;
//import org.springframework.boot.jdbc.DataSourceBuilder;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.context.annotation.Primary;
//import org.springframework.transaction.annotation.EnableTransactionManagement;
//
//import javax.sql.DataSource;
//
//@Configuration
//@MapperScan(basePackages = "com.tsei.www.mapper.no2", sqlSessionFactoryRef = "robotSqlSessionFactory")
//@EnableTransactionManagement
//public class no2DatabaseConfig {
//
//    @Primary
//    @Bean(name = "robotDataSource")
//    @ConfigurationProperties(prefix = "spring.robot.datasource")
//    public DataSource robotDataSource() {
//        return DataSourceBuilder.create().build();
//    }
//
//    @Primary
//    @Bean(name = "robotSqlSessionFactory")
//    public SqlSessionFactory robotSqlSessionFactory(@Qualifier("robotDataSource") DataSource dataSource) throws Exception {
//        SqlSessionFactoryBean sessionFactory = new SqlSessionFactoryBean();
//        sessionFactory.setDataSource(dataSource);
//        return sessionFactory.getObject();
//    }
//
//    @Bean(name = "robotSqlSessionTemplate")
//    public SqlSessionTemplate robotSqlSessionTemplate(@Qualifier("robotSqlSessionFactory") SqlSessionFactory sqlSessionFactory) {
//        return new SqlSessionTemplate(sqlSessionFactory);
//    }
//}

package com.tsei.www.config;

import javax.sql.DataSource;

import org.apache.ibatis.session.SqlSessionFactory;
import org.mybatis.spring.SqlSessionFactoryBean;
import org.mybatis.spring.SqlSessionTemplate;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.annotation.EnableTransactionManagement;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;

@Configuration
@MapperScan(basePackages = "com.tsei.www.mapper.no2", sqlSessionFactoryRef = "robotSqlSessionFactory")
@EnableTransactionManagement
public class no2DatabaseConfig {

    @Bean(name = "robotDataSource")
    @ConfigurationProperties(prefix = "spring.no2.datasource")
    public DataSource robotDataSource() {
        return DataSourceBuilder.create().build();
    }

    @Bean(name = "robotSqlSessionFactory")
    public SqlSessionFactory robotSqlSessionFactory(@Qualifier("robotDataSource") DataSource dataSource, ApplicationContext applicationContext) throws Exception {
        SqlSessionFactoryBean sessionFactory = new SqlSessionFactoryBean();
        sessionFactory.setDataSource(dataSource);

        // ✅ 필수 설정
        sessionFactory.setMapperLocations(
                new PathMatchingResourcePatternResolver().getResources("classpath:/mapper/no2/**/*.xml"));
        sessionFactory.setTypeAliasesPackage("com.tsei.www.dto.robot");

        return sessionFactory.getObject();
    }

    @Bean(name = "robotSqlSessionTemplate")
    public SqlSessionTemplate robotSqlSessionTemplate(@Qualifier("robotSqlSessionFactory") SqlSessionFactory sqlSessionFactory) {
        return new SqlSessionTemplate(sqlSessionFactory);
    }
}
