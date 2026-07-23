# Outputs obligatorios segun el contrato de interfaces (CONVENTIONS.md).

output "collection_id" {
  description = "ID de la coleccion de rostros, lo consumen las Lambdas para IndexFaces y SearchFacesByImage"
  value       = aws_rekognition_collection.faces.collection_id
}

output "collection_arn" {
  description = "ARN de la coleccion de rostros, lo consume el modulo iam para politicas de minimo privilegio"
  value       = aws_rekognition_collection.faces.arn
}
