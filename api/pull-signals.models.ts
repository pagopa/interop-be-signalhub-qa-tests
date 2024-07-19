/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

/**
 * Signal
 * Signal
 */
export interface Signal {
  /** type of signal */
  signalType?: SignalType;
  /**
   * object id
   * @minLength 0
   * @maxLength 500
   * @pattern ^[a-zA-Z0-9\-_]+$
   */
  objectId?: string;
  /**
   * object type
   * @minLength 0
   * @maxLength 500
   * @pattern ^[a-zA-Z0-9\s\-_]+$
   */
  objectType?: string;
  /** eservice Id */
  eserviceId?: string;
  /**
   * sorting signal index
   * @format int64
   */
  signalId?: number;
}

/** PaginationSignal */
export interface PaginationSignal {
  signals?: Signal[];
  /** @format int64 */
  lastSignalId?: number;
}

/** type of signal */
export type SignalType = "CREATE" | "UPDATE" | "DELETE" | "SEEDUPDATE";

export interface Problem {
  /** URI reference of type definition */
  type: string;
  /**
   * The HTTP status code generated by the origin server for this occurrence of the problem.
   * @format int32
   * @min 100
   * @max 600
   * @exclusiveMax true
   * @example 400
   */
  status: number;
  /**
   * A short, summary of the problem type. Written in english and readable
   * @maxLength 64
   * @pattern ^[ -~]{0,64}$
   * @example "Service Unavailable"
   */
  title: string;
  /**
   * Unique identifier of the request
   * @maxLength 64
   * @example "53af4f2d-0c87-41ef-a645-b726a821852b"
   */
  correlationId?: string;
  /**
   * A human readable explanation of the problem.
   * @maxLength 4096
   * @pattern ^.{0,1024}$
   * @example "Request took too long to complete."
   */
  detail?: string;
  /** @minItems 0 */
  errors: ProblemError[];
}

export interface ProblemError {
  /**
   * Internal code of the error
   * @minLength 8
   * @maxLength 8
   * @pattern ^[0-9]{3}-[0-9]{4}$
   * @example "123-4567"
   */
  code: string;
  /**
   * A human readable explanation specific to this occurrence of the problem.
   * @maxLength 4096
   * @pattern ^.{0,1024}$
   * @example "Parameter not valid"
   */
  detail: string;
}

export interface GetRequestParams {
  /**
   * signalId from which to search
   * @format int64
   * @default 0
   */
  signalId: number;
  /**
   * number of signals to search
   * @format int64
   * @default 0
   */
  size?: number;
  /** id of the eservice on witch retrieve signals */
  eserviceId: string;
}

export namespace PullSignal {
  /**
   * @description Retrieve a list o signals on a specific eservice starting from signalId
   * @tags gateway
   * @name GetRequest
   * @summary Get a list of signals
   * @request GET:/signals/{eserviceId}
   * @secure
   */
  export namespace GetRequest {
    export type RequestParams = {
      /** id of the eservice on witch retrieve signals */
      eserviceId: string;
    };
    export type RequestQuery = {
      /**
       * signalId from which to search
       * @format int64
       * @default 0
       */
      signalId: number;
      /**
       * number of signals to search
       * @format int64
       * @default 0
       */
      size?: number;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = PaginationSignal;
  }
}

import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, HeadersDefaults, ResponseType } from "axios";
import axios from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<FullRequestParams, "body" | "method" | "query" | "path">;

export interface ApiConfig<SecurityDataType = unknown> extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({ securityWorker, secure, format, ...axiosConfig }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({ ...axiosConfig, baseURL: axiosConfig.baseURL || "/api-gateway/1.0" });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(params1: AxiosRequestConfig, params2?: AxiosRequestConfig): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method && this.instance.defaults.headers[method.toLowerCase() as keyof HeadersDefaults]) || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === "object" && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] = property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(key, isFileType ? formItem : this.stringifyFormItem(formItem));
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (type === ContentType.FormData && body && body !== null && typeof body === "object") {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (type === ContentType.Text && body && body !== null && typeof body !== "string") {
      body = JSON.stringify(body);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type && type !== ContentType.FormData ? { "Content-Type": type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

/**
 * @title Interoperability API Gateway Micro Service
 * @version 1.0
 * @termsOfService http://swagger.io/terms/
 * @baseUrl /api-gateway/1.0
 * @contact API Support <support@example.com> (http://www.example.com/support)
 *
 * exposes the API for interacting with interoperability features
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  pullSignal = {
    /**
     * @description Retrieve a list o signals on a specific eservice starting from signalId
     *
     * @tags gateway
     * @name GetRequest
     * @summary Get a list of signals
     * @request GET:/signals/{eserviceId}
     * @secure
     */
    getRequest: ({ eserviceId, ...query }: GetRequestParams, params: RequestParams = {}) =>
      this.request<PaginationSignal, Problem>({
        path: `/signals/${eserviceId}`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),
  };
}
