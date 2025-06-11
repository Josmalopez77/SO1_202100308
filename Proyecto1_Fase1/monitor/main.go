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
		ramRaw, err := readProcFile("/proc/ram_202100308")
		if err != nil {
			log.Println("Error leyendo RAM:", err)
			continue
		}

		cpuRaw, err := readProcFile("/proc/cpu_202100308")
		if err != nil {
			log.Println("Error leyendo CPU:", err)
			continue
		}

		ramInfo, err := parseRAM(ramRaw)
		if err != nil {
			log.Println("Error parseando RAM:", err)
		} else {
			fmt.Println("RAM:", ramInfo)
			 sendToAPI("http://localhost:3000/api/ram", ramInfo)
		}

		cpuInfo, err := parseCPU(cpuRaw)
		if err != nil {
			log.Println("Error parseando CPU:", err)
		} else {
			fmt.Println("CPU:", cpuInfo)
			 sendToAPI("http://localhost:3000/api/cpu", cpuInfo)
		}

		time.Sleep(5 * time.Second)
	}
}
