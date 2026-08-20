import 'dart:io';

void main() {
  final packageDir = Directory.current;
  final sourceDir = Directory('${packageDir.parent.path}/data');
  final targetDir = Directory('${packageDir.path}/assets/data');

  if (!sourceDir.existsSync()) {
    stderr.writeln('Source data/ directory not found at ${sourceDir.path}');
    exit(1);
  }

  if (!targetDir.existsSync()) {
    targetDir.createSync(recursive: true);
  }

  var copied = 0;
  for (final entity in sourceDir.listSync()) {
    if (entity is File && entity.path.endsWith('.json')) {
      final target = File('${targetDir.path}/${entity.uri.pathSegments.last}');
      entity.copySync(target.path);
      stdout.writeln('Copied ${entity.uri.pathSegments.last}');
      copied++;
    }
  }

  stdout.writeln('Done — $copied file(s) synced.');
}
