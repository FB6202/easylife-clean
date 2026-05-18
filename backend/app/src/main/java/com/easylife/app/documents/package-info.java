@org.springframework.modulith.ApplicationModule(
        displayName = "Documents",
        allowedDependencies = {
                "users::api",
                "categories::api",
                "storage::api",
                "shared"
        })
package com.easylife.app.documents;