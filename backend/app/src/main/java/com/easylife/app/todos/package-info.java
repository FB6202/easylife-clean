@org.springframework.modulith.ApplicationModule(
        displayName = "Todos",
        allowedDependencies = {
                "users::api",
                "categories::api",
                "shared"
        })
package com.easylife.app.todos;