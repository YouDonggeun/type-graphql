import {
  GraphQLField,
  GraphQLDirective,
  DirectiveLocation,
  GraphQLInputObjectType,
  GraphQLInputField,
  GraphQLScalarType,
  GraphQLNonNull,
  GraphQLSchema,
  defaultFieldResolver,
} from "graphql";
import { getDirective, MapperKind, mapSchema } from "@graphql-tools/utils";

class UpperCaseType extends GraphQLScalarType {
  constructor(type: any) {
    super({
      name: "UpperCase",
      parseValue: value => this.upper(type.parseValue(value)),
      serialize: value => this.upper(type.serialize(value)),
      parseLiteral: ast => this.upper(type.parseLiteral(ast)),
    });
  }

  upper(value: any) {
    return typeof value === "string" ? value.toUpperCase() : value;
  }
}
export function upperCaseDirective(schema: GraphQLSchema, directiveName: string) {
  return mapSchema(schema, {
    [DirectiveLocation.FIELD_DEFINITION]: fieldConfig => {
      const upperDirective = getDirective(schema, fieldConfig, directiveName)?.[0];

      if (upperDirective) {
        if (fieldConfig.type instanceof UpperCaseType) {
          /* noop */
        } else if (
          fieldConfig.type instanceof GraphQLNonNull &&
          fieldConfig.type.ofType instanceof GraphQLScalarType
        ) {
          fieldConfig.type = new GraphQLNonNull(new UpperCaseType(fieldConfig.type.ofType));
        } else if (fieldConfig.type instanceof GraphQLScalarType) {
          fieldConfig.type = new UpperCaseType(fieldConfig.type);
        } else {
          throw new Error(`Not a scalar type: ${fieldConfig.type}`);
        }
        return fieldConfig;
      }
      throw new Error(`Not a scalar type: ${fieldConfig.type}`);
    },
  });
}
export class UpperCaseDirective extends SchemaDirectiveVisitor {
  static getDirectiveDeclaration(directiveName: string): GraphQLDirective {
    return new GraphQLDirective({
      name: directiveName,
      locations: [DirectiveLocation.FIELD_DEFINITION],
    });
  }

  visitFieldDefinition(field: GraphQLField<any, any>) {
    this.wrapField(field);
  }

  visitInputObject(object: GraphQLInputObjectType) {
    const fields = object.getFields();

    Object.keys(fields).forEach(field => {
      this.wrapField(fields[field]);
    });
  }

  visitInputFieldDefinition(field: GraphQLInputField) {
    this.wrapField(field);
  }

  wrapField(field: GraphQLField<any, any> | GraphQLInputField): void {
    if (field.type instanceof UpperCaseType) {
      /* noop */
    } else if (
      field.type instanceof GraphQLNonNull &&
      field.type.ofType instanceof GraphQLScalarType
    ) {
      field.type = new GraphQLNonNull(new UpperCaseType(field.type.ofType));
    } else if (field.type instanceof GraphQLScalarType) {
      field.type = new UpperCaseType(field.type);
    } else {
      throw new Error(`Not a scalar type: ${field.type}`);
    }
  }
}
