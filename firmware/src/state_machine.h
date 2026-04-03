#ifndef STATE_MACHINE_H
#define STATE_MACHINE_H

#include <Arduino.h>
#include "config.h"

// Forward declarations
class NFCHandler;
class DisplayHandler;
class LEDHandler;
class AudioHandler;
class NetworkHandler;
class StorageHandler;

class StateMachine {
public:
    StateMachine();
    ~StateMachine();

    // Initialization
    void init();

    // Main state machine loop - call this from main loop
    void update();

    // State accessors
    DeviceState getCurrentState() const { return currentState; }
    DeviceState getPreviousState() const { return previousState; }

    // Event triggers from subsystems
    void onCardDetected(uint8_t* uid, uint8_t uidLength);
    void onCardReadError();
    void onNetworkConnected();
    void onNetworkDisconnected();
    void onServerConnected();
    void onServerDisconnected();
    void onAttendanceProcessed(bool success, const char* studentName, const char* status);
    void onServerCommand(const char* command, const char* param);
    void onEmergencyMode(EmergencyMode mode);
    void onFirmwareUpdateAvailable(const char* url, const char* version);
    void onFirmwareUpdateProgress(int percent);
    void onFirmwareUpdateComplete(bool success);

    // Manual state transitions for testing
    void forceState(DeviceState state);

    // Wristband programming mode
    void enterProgramMode();
    void exitProgramMode();
    void onWristbandProgrammed(bool success, const char* cardUid, const char* message);

    // Getters for subsystems
    NFCHandler* getNFCHandler() { return nfcHandler; }
    DisplayHandler* getDisplayHandler() { return displayHandler; }
    LEDHandler* getLEDHandler() { return ledHandler; }
    AudioHandler* getAudioHandler() { return audioHandler; }
    NetworkHandler* getNetworkHandler() { return networkHandler; }
    StorageHandler* getStorageHandler() { return storageHandler; }

private:
    // State transition
    void transitionToState(DeviceState newState);
    void onStateEnter(DeviceState state);
    void onStateExit(DeviceState state);
    void onStateLoop(DeviceState state);

    // Helper methods
    void performStateBootLogic();
    void performStateWifiConnectingLogic();
    void performStateServerConnectingLogic();
    void performStateIdleLogic();
    void performStateCardDetectedLogic();
    void performStateProcessingLogic();
    void performStateSuccessLogic();
    void performStateFailureLogic();
    void performStateErrorLogic();
    void performStateEmergencyLogic();
    void performStateFirmwareUpdateLogic();
    void performStateOfflineLogic();
    void performStateProgramModeLogic();
    void performStateProgramCardDetectedLogic();
    void performStateProgramProcessingLogic();
    void performStateProgramSuccessLogic();
    void performStateProgramFailureLogic();

    // Error recovery
    void handleError(const char* errorMsg);
    void attemptRecovery();

    // Members
    DeviceState currentState;
    DeviceState previousState;
    unsigned long stateEnterTime;
    unsigned long lastHeartbeat;
    unsigned long lastNFCScan;
    unsigned long lastDisplayUpdate;
    int retryCount;

    // Temporary storage for card detection
    uint8_t lastCardUID[10];
    uint8_t lastCardUIDLength;
    unsigned long lastCardDetectionTime;
    char lastStudentName[64];
    char lastStudentStatus[32];

    // Subsystems
    NFCHandler* nfcHandler;
    DisplayHandler* displayHandler;
    LEDHandler* ledHandler;
    AudioHandler* audioHandler;
    NetworkHandler* networkHandler;
    StorageHandler* storageHandler;

    // Configuration
    char deviceId[MAX_DEVICE_ID_LENGTH];
    char roomName[MAX_ROOM_NAME_LENGTH];
    EmergencyMode emergencyMode;
    int audioVolume;
    bool isConnectedToServer;
    bool isConnectedToWiFi;

    // Firmware update state
    char pendingFirmwareUrl[256];
    char pendingFirmwareVersion[32];
    int firmwareUpdateProgress;
    bool firmwareUpdateInProgress;

    // Wristband programming mode state
    bool inProgramMode;
    unsigned long programModeEnterTime;
    char lastProgrammedUID[32];
};

#endif // STATE_MACHINE_H
