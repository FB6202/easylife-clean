@org.springframework.modulith.ApplicationModule(
        displayName = "WeekPlan",
        allowedDependencies = {
                "users::api",
                "categories::api",
                "shared"
        })
package com.easylife.app.weekplan;