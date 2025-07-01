package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io/ioutil"
    "log"
    "net/http"
    "time"
)


// Estructura para RAM
type RAMInfo struct {
	TotalRAM        uint64 `json:"total_ram"`
	FreeRAM         uint64 `json:"free_ram"`
	UsedRAM         uint64 `json:"used_ram"`
	RAMUsagePercent uint64 `json:"ram_usage_percent"`
}

// Estructura para CPU
type CPUInfo struct {
	TotalProcesses     uint64 `json:"total_processes"`
	RunningProcesses   uint64 `json:"running_processes"`
	OnlineCPUs         uint64 `json:"online_cpus"`
	CPUUsagePercent    uint64 `json:"cpu_usage_percent"`
}

// Estructura para Procesos
type ProcessInfo struct {
	ProcesosCorriendo  int `json:"procesos_corriendo"`
	TotalProcesos      int `json:"total_procesos"`
	ProcesosDurmiendo  int `json:"procesos_durmiendo"`
	ProcesosZombie     int `json:"procesos_zombie"`
	ProcesosParados    int `json:"procesos_parados"`
}

// Leer archivo de /proc
func readProcFile(path string) ([]byte, error) {
	data, err := ioutil.ReadFile(path)
	if err != nil {
		return nil, err
	}
	return data, nil
}

// Convertir texto JSON a estructura
func parseRAM(data []byte) (RAMInfo, error) {
	var info RAMInfo
	err := json.Unmarshal(data, &info)
	return info, err
}

func parseCPU(data []byte) (CPUInfo, error) {
	var info CPUInfo
	err := json.Unmarshal(data, &info)
	return info, err
}

func parseProcess(data []byte) (ProcessInfo, error) {
	var info ProcessInfo
	err := json.Unmarshal(data, &info)
	return info, err
}

// Enviar datos a la API (aún no creada)
func sendToAPI(endpoint string, payload interface{}) {
	jsonData, err := json.Marshal(payload)
	if err != nil {
		log.Println("Error al convertir JSON:", err)
		return
	}

	resp, err := http.Post(endpoint, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		log.Println("Error al enviar datos:", err)
		return
	}
	defer resp.Body.Close()
	log.Println("Datos enviados a", endpoint, "-", resp.Status)
}

func getSystemInfo() (map[string]interface{}, error) {
	info := make(map[string]interface{})

	// RAM
	ramRaw, err := readProcFile("/proc/ram_202100308")
	if err != nil {
		return nil, err
	}
	ramInfo, err := parseRAM(ramRaw)
	if err != nil {
		return nil, err
	}

	// CPU
	cpuRaw, err := readProcFile("/proc/cpu_202100308")
	if err != nil {
		return nil, err
	}
	cpuInfo, err := parseCPU(cpuRaw)
	if err != nil {
		return nil, err
	}

	// Procesos
	procRaw, err := readProcFile("/proc/procesos_202100308")
	if err != nil {
		return nil, err
	}
	procInfo, err := parseProcess(procRaw)
	if err != nil {
		return nil, err
	}

	// Unir todo en un solo JSON
	info["total_ram"] = ramInfo.TotalRAM
	info["ram_libre"] = ramInfo.FreeRAM
	info["uso_ram"] = ramInfo.UsedRAM
	info["porcentaje_ram"] = ramInfo.RAMUsagePercent

	info["porcentaje_cpu_uso"] = cpuInfo.CPUUsagePercent
	info["porcentaje_cpu_libre"] = 100 - cpuInfo.CPUUsagePercent
	info["procesos_corriendo"] = procInfo.ProcesosCorriendo
	info["total_procesos"] = procInfo.TotalProcesos
	info["procesos_durmiendo"] = procInfo.ProcesosDurmiendo
	info["procesos_zombie"] = procInfo.ProcesosZombie
	info["procesos_parados"] = procInfo.ProcesosParados

	info["hora"] = time.Now().Format("2006-01-02 15:04:05")

	return info, nil
}

func handler(w http.ResponseWriter, r *http.Request) {
	info, err := getSystemInfo()
	if err != nil {
		http.Error(w, "Error al obtener datos", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(info)
}


func main() {
	http.HandleFunc("/info", handler)
	fmt.Println("Servidor corriendo en puerto 8000...")
	log.Fatal(http.ListenAndServe(":8000", nil))
}

