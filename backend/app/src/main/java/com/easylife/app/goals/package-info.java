@org.springframework.modulith.ApplicationModule(
        displayName = "Goals",
        allowedDependencies = {
                "users::api",
                "categories::api",
                "storage::api",
                "shared"
        })
package com.easylife.app.goals;