use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct VideoLessonResponse {
    #[serde(rename = "_id")]
    pub id: String,
    pub student_id: String,
}

fn main() {
    let r = VideoLessonResponse {
        id: "123".to_string(),
        student_id: "456".to_string(),
    };
    println!("{}", serde_json::to_string(&r).unwrap());
}
