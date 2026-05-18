package com.easylife.app.goals;

import com.easylife.app.goals.payload.*;
import com.easylife.app.shared.payload.PageResponse;

public interface GoalService {

    GoalResponse create(GoalRequest request, Long userId);

    GoalResponse findById(Long id, Long userId);

    PageResponse<GoalResponse> findAll(Long userId, GoalFilter filter, int page, int size);

    GoalResponse update(Long id, GoalRequest request, Long userId);

    GoalResponse updateProgress(Long id, Integer progress, Long userId);

    GoalResponse updateImage(Long id, String imagePath, Long userId);

    void delete(Long id, Long userId);

    GoalTaskResponse addTask(Long goalId, GoalTaskRequest request, Long userId);

    GoalTaskResponse updateTask(Long goalId, Long taskId, GoalTaskRequest request, Long userId);

    void deleteTask(Long goalId, Long taskId, Long userId);

    String generateImageUploadUrl(Long goalId, Long userId, String fileName, String contentType);

}
