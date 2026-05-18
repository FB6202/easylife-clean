@org.springframework.modulith.ApplicationModule(
        displayName = "Users",
        allowedDependencies = {"storage::api", "shared", "categories :: api", "goals :: api"})
package com.easylife.app.users;