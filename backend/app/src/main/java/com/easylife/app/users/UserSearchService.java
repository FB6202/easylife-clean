package com.easylife.app.users;

import com.easylife.app.users.payload.UserSearchResponse;
import java.util.List;

public interface UserSearchService {

    List<UserSearchResponse> search(String query, Long requesterId);

}
