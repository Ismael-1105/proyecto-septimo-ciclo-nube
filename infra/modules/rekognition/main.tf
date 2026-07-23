# Modulo rekognition: coleccion de rostros para la identificacion 1:N.
# La coleccion almacena vectores faciales (no imagenes) de los estudiantes
# enrolados; las Lambdas la usan con IndexFaces y SearchFacesByImage.
# Face Liveness NO es un recurso de Terraform: es una API en tiempo de
# ejecucion y sus permisos se otorgan en el modulo iam (ver README.md).

resource "aws_rekognition_collection" "faces" {
  collection_id = "${var.name_prefix}-rostros"

  tags = var.tags
}
