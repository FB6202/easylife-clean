@org.springframework.modulith.ApplicationModule(
        displayName = "Calendar",
        allowedDependencies = {
                "users::api",
                "categories::api",
                "shared"
        })
package com.easylife.app.calendar;