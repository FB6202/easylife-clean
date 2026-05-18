package com.easylife.app;

import com.tngtech.archunit.core.domain.JavaClasses;
import com.tngtech.archunit.junit.AnalyzeClasses;
import com.tngtech.archunit.junit.ArchTest;
import org.springframework.modulith.core.ApplicationModules;

@AnalyzeClasses(packages = "app")
public class VerifyApplicationModulesTest {

    @ArchTest
    void verifyModularStructure(JavaClasses importedClasses) {
        ApplicationModules modules = ApplicationModules.of(AppApplication.class);
        modules.verify();
    }

}
