import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:http/browser_client.dart' as browser_http;

class API {
  final basePath = 'http://localhost:3000';

  Future<Map<String, dynamic>> createUser(Map data) async {
    final url = Uri.parse('$basePath/create');
    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(data),
      );
      final statusCode = response.statusCode;
      try {
        if (statusCode == 200 || statusCode == 201) {
          Map<String, dynamic> decoded = Map<String, dynamic>.from(
            jsonDecode(response.body),
          );
          decoded['statusCode'] = statusCode;
          return decoded;
        } else {
          return {'error': 'something not good', 'statusCode': statusCode};
        }
      } catch (e) {
        return {
          'error': 'Invalid Json response from server',
          'statusCode': statusCode,
        };
      }
    } catch (e) {
      return {'error': e.toString()};
    }
  }

  Future<Map<String, dynamic>> login(Map<String, dynamic> data) async {
    final url = Uri.parse('$basePath/login');
    final client = browser_http.BrowserClient(); // ✅ Fixed name
    client.withCredentials = true; // ✅ Allow cookies for Web
    try {
      final response = await client.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(data),
      );
      final statusCode = response.statusCode;
      try {
        if (statusCode == 200 || statusCode == 201) {
          Map<String, dynamic> decoded = Map<String, dynamic>.from(
            (jsonDecode(response.body)),
          );
          decoded['statusCode'] = statusCode;
          return decoded;
        } else {
          return {'error': 'something not good', 'statusCode': statusCode};
        }
      } catch (e) {
        return {
          'error': 'Invalid JSON response from server',
          'statusCode': statusCode,
        };
      }
    } catch (e) {
      return {'error': e.toString()};
    } finally {
      client.close(); // ✅ Always close the client
    }
  }

  Future<Map<String, dynamic>> whoAmI() async {
    final url = Uri.parse('$basePath/whoami');
    final client = browser_http.BrowserClient()..withCredentials = true;
    final response = await client.get(url);
    client.close();
    return jsonDecode(response.body);
  }
}
