import * as tf from "@tensorflow/tfjs";
import { renderBoxes } from "./renderBox";
import yaml from "js-yaml";

async function loadYamlFile(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch the YAML file: ${response.statusText}`);
        }
        const text = await response.text();
        const doc = yaml.load(text);
        console.log(doc)
        return doc;
    } catch (e) {
        console.error("Error loading or parsing the YAML file:", e);
    }
}

// YAML 파일 경로를 지정하고 파일을 로드
loadYamlFile("../yolov8n_web_model/metadata.yaml");