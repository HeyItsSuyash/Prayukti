use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct VideoLessonResponse {
    #[serde(rename = "_id")]
    pub id: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct CompleteLessonPayload {
    pub lesson: VideoLessonResponse,
}

fn main() {
    let r = CompleteLessonPayload {
        lesson: VideoLessonResponse {
            id: "123".to_string(),
        }
    };
    println!("{}", serde_json::to_string(&r).unwrap());
}
