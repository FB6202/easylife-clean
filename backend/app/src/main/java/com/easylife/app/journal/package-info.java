@org.springframework.modulith.ApplicationModule(
        displayName = "Journals",
        allowedDependencies = {
                "users::api",
                "categories::api",
                "weekplan::api",
                "shared"
        })
package com.easylife.app.journal;