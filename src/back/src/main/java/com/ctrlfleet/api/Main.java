package com.ctrlfleet.api;

import java.net.URI;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Main {

	public static void main(String[] args) {
		configureDatasourceFromRenderUrl();
		SpringApplication.run(Main.class, args);
	}

	private static void configureDatasourceFromRenderUrl() {
		String springDatasourceUrl = System.getenv("SPRING_DATASOURCE_URL");
		String databaseUrl = System.getenv("DATABASE_URL");

		if (hasText(springDatasourceUrl) || !hasText(databaseUrl) || !isPostgresUrl(databaseUrl)) {
			return;
		}

		URI uri = URI.create(databaseUrl);
		String jdbcUrl = "jdbc:postgresql://" + uri.getHost() + resolvePort(uri) + resolveDatabasePath(uri)
				+ resolveQuery(uri);

		System.setProperty("spring.datasource.url", jdbcUrl);

		String userInfo = uri.getUserInfo();
		if (hasText(userInfo) && !hasText(System.getenv("SPRING_DATASOURCE_USERNAME"))) {
			System.setProperty("spring.datasource.username", userInfo.split(":", 2)[0]);
		}
		if (hasText(userInfo) && userInfo.contains(":") && !hasText(System.getenv("SPRING_DATASOURCE_PASSWORD"))) {
			System.setProperty("spring.datasource.password", userInfo.split(":", 2)[1]);
		}
	}

	private static boolean isPostgresUrl(String databaseUrl) {
		return databaseUrl.startsWith("postgres://") || databaseUrl.startsWith("postgresql://");
	}

	private static String resolvePort(URI uri) {
		return uri.getPort() > 0 ? ":" + uri.getPort() : "";
	}

	private static String resolveDatabasePath(URI uri) {
		return hasText(uri.getPath()) ? uri.getPath() : "";
	}

	private static String resolveQuery(URI uri) {
		return hasText(uri.getQuery()) ? "?" + uri.getQuery() : "";
	}

	private static boolean hasText(String value) {
		return value != null && !value.isBlank();
	}

}
