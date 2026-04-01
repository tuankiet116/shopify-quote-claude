<?php

namespace App\Http\Controllers;

use App\Http\Requests\ButtonSettingRequest;
use App\Services\ButtonSettingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ButtonSettingController extends Controller
{
    public function __construct(private ButtonSettingService $service) {}

    public function show(Request $request): JsonResponse
    {
        $settings = $this->service->getSettings($this->shop($request));

        return $this->success($settings);
    }

    public function update(ButtonSettingRequest $request): JsonResponse
    {
        $setting = $this->service->updateSettings(
            $this->shop($request),
            $request->validated(),
        );

        return $this->success($setting->toMetafieldJson());
    }
}
