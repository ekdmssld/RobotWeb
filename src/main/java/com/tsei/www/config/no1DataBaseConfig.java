//package com.tsei.www.config;
//
//import javax.sql.DataSource;
//
//import org.apache.ibatis.session.SqlSessionFactory;
//import org.mybatis.spring.SqlSessionFactoryBean;
//import org.mybatis.spring.SqlSessionTemplate;
//import org.mybatis.spring.annotation.MapperScan;
//import org.springframework.beans.factory.annotation.Qualifier;
//import org.springframework.boot.context.properties.ConfigurationProperties;
//import org.springframework.boot.jdbc.DataSourceBuilder;
//import org.springframework.context.ApplicationContext;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.context.annotation.Primary;
//import org.springframework.transaction.annotation.EnableTransactionManagement;
//
//@Configuration
//@MapperScan(value="com.tsei.www.mapper.no1", sqlSessionFactoryRef="no1SqlSessionFactory")
//@EnableTransactionManagement
//public class no1DataBaseConfig {
//
//	@Primary
//	@Bean(name="no1DataSource")
//	@ConfigurationProperties(prefix="spring.no1.datasource")
//	public DataSource no1DataSource() {
//		//application.properties에서 정의한 DB 연결 정보를 빌드
//		return DataSourceBuilder.create().build();
//	}
//
//	@Primary
//	@Bean(name="no1SqlSessionFactory")
//	public SqlSessionFactory no1SqlSessionFactory(@Qualifier("no1DataSource") DataSource no1DataSource, ApplicationContext applicationContext) throws Exception{
//		//세션 생성 시, 빌드된 DataSource를 세팅하고 SQL문을 관리할 mapper.xml의 경로를 알려준다.
//		SqlSessionFactoryBean sqlSessionFactoryBean = new SqlSessionFactoryBean();
//		sqlSessionFactoryBean.setDataSource(no1DataSource);
//		sqlSessionFactoryBean.setMapperLocations(applicationContext.getResources("classpath:/mapper/**/*_no1.xml"));
//		return sqlSessionFactoryBean.getObject();
//	}
//
//	@Primary
//	@Bean(name="no1SqlSessionTemplate")
//	public SqlSessionTemplate no1SqlSessionTemplate(SqlSessionFactory no1SqlSessionTemplate) throws Exception{
//		return new SqlSessionTemplate(no1SqlSessionTemplate);
//	}
//
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
import org.springframework.context.annotation.Primary;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@Configuration
@MapperScan(value="com.tsei.www.mapper.no1", sqlSessionFactoryRef="no1SqlSessionFactory")
@EnableTransactionManagement
public class no1DataBaseConfig {

	@Primary
	@Bean(name="no1DataSource")
	@ConfigurationProperties(prefix="spring.no1.datasource")
	public DataSource no1DataSource() {
		return DataSourceBuilder.create().build();
	}

	@Primary
	@Bean(name="no1SqlSessionFactory")
	public SqlSessionFactory no1SqlSessionFactory(@Qualifier("no1DataSource") DataSource no1DataSource, ApplicationContext applicationContext) throws Exception {
		SqlSessionFactoryBean sqlSessionFactoryBean = new SqlSessionFactoryBean();
		sqlSessionFactoryBean.setDataSource(no1DataSource);
		sqlSessionFactoryBean.setMapperLocations(applicationContext.getResources("classpath:/mapper/no1/**/*_no1.xml"));
		sqlSessionFactoryBean.setTypeAliasesPackage("com.tsei.www.dto.tracking"); // 선택
		return sqlSessionFactoryBean.getObject();
	}

	@Primary
	@Bean(name="no1SqlSessionTemplate")
	public SqlSessionTemplate no1SqlSessionTemplate(@Qualifier("no1SqlSessionFactory") SqlSessionFactory sqlSessionFactory) {
		return new SqlSessionTemplate(sqlSessionFactory);
	}
}
