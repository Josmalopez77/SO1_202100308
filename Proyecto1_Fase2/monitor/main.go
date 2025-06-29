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


func main() {
	for {
		// Leer RAM
		ramRaw, err := readProcFile("/proc/ram_202100308")
		if err != nil {
			log.Println("Error leyendo RAM:", err)
			continue
		}

		// Leer CPU
		cpuRaw, err := readProcFile("/proc/cpu_202100308")
		if err != nil {
			log.Println("Error leyendo CPU:", err)
			continue
		}

		// Leer Procesos
		procRaw, err := readProcFile("/proc/procesos_202100308")
		if err != nil {
			log.Println("Error leyendo Procesos:", err)
		}

		// Parsear y enviar RAM
		ramInfo, err := parseRAM(ramRaw)
		if err != nil {
			log.Println("Error parseando RAM:", err)
		} else {
			fmt.Println("RAM:", ramInfo)
			sendToAPI("http://127.0.0.1:3001/api/ram", ramInfo)
		}

		// Parsear y enviar CPU
		cpuInfo, err := parseCPU(cpuRaw)
		if err != nil {
			log.Println("Error parseando CPU:", err)
		} else {
			fmt.Println("CPU:", cpuInfo)
			sendToAPI("http://127.0.0.1:3001/api/cpu", cpuInfo)
		}

		// Parsear y enviar Procesos
		if procRaw != nil {
			procInfo, err := parseProcess(procRaw)
			if err != nil {
				log.Println("Error parseando Procesos:", err)
			} else {
				fmt.Println("Procesos:", procInfo)
				sendToAPI("http://127.0.0.1:3001/api/procesos", procInfo)
			}
		}

		time.Sleep(5 * time.Second)
	}
}

